import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  /** Leaf item — provides the route path */
  path?: string
  /** Sub-menu children — when present this item becomes a group/dropdown */
  children?: NavItem[]
  disabled?: boolean
  /** Small badge shown at the end of the row (e.g. "Soon", "Beta", plan name) */
  badge?: string
  /** Shorthand: disabled + badge "Soon" */
  comingSoon?: boolean
}

export type MenuProps = {
  /** Active route path */
  activePath: string
  /** Sidebar collapsed (icon-only mode) */
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

export type MenuContext = MenuProps & {
  /** Unique ID per NavMenu instance — used for framer-motion layoutId */
  menuId: string
  /** Currently hovered item id — drives the fluid hover pill animation */
  hoveredId: string | null
  setHoveredId: (id: string | null) => void
  openedMenus: Set<string>
  openMenu:  (id: string, parentIds: string[]) => void
  closeMenu: (id: string) => void
}
