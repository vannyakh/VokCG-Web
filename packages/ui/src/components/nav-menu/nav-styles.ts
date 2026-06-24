import type { CSSProperties } from 'react'

export const NAV_MENU = {
  marginX: 4,
  itemRadius: 8,
  collapsedPaddingX: 10,
  collapsedTileSize: 42,
  collapsedTileRadius: 11,
  collapsedIconSize: 20,
  collapsedIconStroke: 1.85,
  collapsedIconStrokeActive: 2.25,
  collapsedItemHeight: 42,
  collapsedItemGap: 2,
  nestedItemHeightOffset: 2,
  sectionGap: 0,
  itemGap: 0,
  treeBranchWidth: 12,
  treeGuideOffset: 7,
} as const

/** Collapsed sidebar flyout panel */
export const NAV_FLYOUT = {
  minWidth: 168,
  radius: 10,
  offsetX: 10,
  padding: 6,
  itemHeight: 34,
  headerPaddingX: 12,
  headerPaddingY: 8,
} as const

/** Row backgrounds — active only in sidebar; flyout keeps a light hover */
export const navSurface = {
  active: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
  nestedActive: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
  flyoutHover: 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
} as const

export function navRowRadius(nested: boolean, inPopup: boolean) {
  if (inPopup) return 8
  return nested ? 8 : NAV_MENU.itemRadius
}

export function navIconColor(active: boolean): CSSProperties {
  return {
    color: active ? 'var(--color-primary)' : 'var(--text-nav-inactive)',
  }
}

export function navCollapsedTileStyle(active: boolean): CSSProperties {
  return {
    width: NAV_MENU.collapsedTileSize,
    height: NAV_MENU.collapsedTileSize,
    background: active ? navSurface.active : 'transparent',
    color: active ? 'var(--color-primary)' : 'var(--text-nav-inactive)',
  }
}

export function navTreeLineColor(active: boolean): string {
  return active
    ? 'color-mix(in srgb, var(--color-primary) 42%, transparent)'
    : 'color-mix(in srgb, var(--text-muted) 16%, transparent)'
}

export function navTreeDotColor(active: boolean): string {
  return active
    ? 'var(--color-primary)'
    : 'color-mix(in srgb, var(--text-muted) 26%, transparent)'
}

/** Full-width button in expanded mode */
export function navItemButtonClass({
  collapse,
  inPopup,
  isActive,
  disabled,
  nested,
}: {
  collapse: boolean
  inPopup: boolean
  isActive: boolean
  disabled: boolean
  nested?: boolean
}) {
  if (collapse && !inPopup) {
    return 'group flex w-full select-none items-center justify-center'
  }

  return [
    'group relative flex w-full select-none items-center text-left transition-colors duration-150',
    inPopup ? 'gap-2 rounded-lg' : nested ? 'gap-2' : 'gap-2.5',
    isActive
      ? 'text-accent'
      : disabled
        ? 'cursor-not-allowed text-muted/40'
        : inPopup
          ? 'text-nav-inactive hover:bg-[color-mix(in_srgb,var(--text-muted)_8%,transparent)] hover:text-nav-active'
          : 'text-nav-inactive hover:text-nav-active',
  ].join(' ')
}
