import type { LucideIcon } from 'lucide-react'

// ── Mirrors Vben MenuItemProps / SubMenuProps ────────────────────────────────

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  /** Leaf item — provides the route path */
  path?: string
  /** Sub-menu children — when present this item becomes a group */
  children?: NavItem[]
  disabled?: boolean
  /** Small label shown at the end of the row (e.g. "Soon", "Beta") */
  badge?: string
  /** Shorthand: disabled + badge "Soon" */
  comingSoon?: boolean
}

// ── Mirrors Vben MenuProps ────────────────────────────────────────────────────

export type MenuProps = {
  /** Active route path */
  activePath: string
  /** Sidebar collapsed (icon-only) */
  collapse: boolean
  /** Only one sub-menu open at a time (default true) */
  accordion?: boolean
  /** Rounded item style */
  rounded?: boolean
  /** Item height in px */
  itemHeight?: number
  /** Called when a leaf item is clicked */
  onSelect: (item: NavItem) => void
}

// ── Mirrors Vben MenuProvider (shared via React context) ─────────────────────

export type MenuContext = MenuProps & {
  openedMenus: Set<string>
  openMenu:  (id: string, parentIds: string[]) => void
  closeMenu: (id: string) => void
}
