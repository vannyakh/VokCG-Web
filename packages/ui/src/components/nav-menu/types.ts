import type { LucideIcon } from "lucide-react";

export type NavBadgeVariant = "soon" | "beta" | "new" | "custom";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Leaf item — provides the route path */
  path?: string;
  /** Sub-menu children — when present this item becomes a group/dropdown */
  children?: NavItem[];
  disabled?: boolean;
  /** Small badge shown at the end of the row */
  badge?: string;
  /** Badge colour variant. Defaults to 'soon' amber style */
  badgeVariant?: NavBadgeVariant;
  /** Shorthand: disabled + badge "Soon" */
  comingSoon?: boolean;
  /** Render a thin divider line above this item (expanded sidebar only) */
  divider?: boolean;
  /** Override the tooltip shown in collapsed mode (defaults to label) */
  tooltip?: string;
};

/** Grouped nav items with optional section divider label (expanded mode only) */
export type NavMenuSection = {
  id: string;
  /** Optional label above the divider line */
  label?: string;
  items: NavItem[];
};

export type MenuProps = {
  /** Active route path */
  activePath: string;
  /** Sidebar collapsed (icon-only mode) */
  collapse: boolean;
  /** Only one sub-menu open at a time (default true) */
  accordion?: boolean;
  /** Rounded item style */
  rounded?: boolean;
  /** Item height in px */
  itemHeight?: number;
  /** Called when a leaf item is clicked */
  onSelect: (item: NavItem) => void;
};

export type MenuContext = MenuProps & {
  /** Unique ID per NavMenu instance — used for framer-motion layoutId */
  menuId: string;
  /** Currently hovered item id — drives the fluid hover pill animation */
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  openedMenus: Set<string>;
  openMenu: (id: string, parentIds: string[]) => void;
  closeMenu: (id: string) => void;
  toggleMenu: (id: string, parentIds: string[]) => void;
};
